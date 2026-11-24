#!/usr/bin/env python3
"""Calcula el embudo diario del Portal Fit con Damián a partir de respuestas guardadas de Ninjo.

Entradas (ficheros JSON tal cual los devuelve el conector de Ninjo):
  --conv   respuestas de search_conversations (has_agent "any", channel INSTAGRAM), varias páginas/días
  --final  respuestas de list_crm_contacts filtradas por booking_data_requested = true
  --datos  respuestas de list_crm_contacts filtradas por email_shared contiene "@"
  --dias   días (YYYY-MM-DD, hora de Madrid) que están completos en --conv y se deben emitir

Salida: un JSON con las escrituras para ArtifactData "batch" (sin if_version):
  data/metricas/embudo/<día>              entradas por origen y hasta dónde llegan
  data/metricas/contenido/<reel>_<día>    lo mismo para la gente que entra comentando un reel o post

Origen de cada conversación (por su primer mensaje):
  bienvenida  la abrimos nosotros y el texto lleva "bienvenida" (seguidora nueva)
  saludo      la abrimos nosotros con otro texto (seguidora que ya estaba)
  comentario  empieza con un comentario suyo en un reel o post
  mensaje     nos escribe ella primero por privado (DM, respuesta a historia o anuncio)
"conversan" = ella escribe por privado (en bienvenida/saludo/comentario, después de nuestro primer mensaje).
"""
import argparse, json, re, sys
from collections import defaultdict
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

MAD = ZoneInfo("Europe/Madrid")
ORIGENES = ("bienvenida", "saludo", "comentario", "mensaje")


def cargar(path):
    with open(path) as f:
        return json.load(f)


def dia_madrid(sent_at):
    s = sent_at.replace("Z", "+00:00")
    dt = datetime.fromisoformat(s)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(MAD).date().isoformat()


def ids_contactos(paths):
    ids = set()
    for p in paths:
        d = cargar(p)
        for c in d.get("data", d).get("contacts", []):
            ids.add(c["id"])
    return ids


def codigo_post(url):
    m = re.search(r"instagram\.com/(?:reel|p|tv)/([A-Za-z0-9_-]+)", url or "")
    return m.group(1) if m else None


def clasificar(conv):
    msgs = sorted(conv.get("messages") or [], key=lambda m: m.get("sent_at") or "")
    if not msgs:
        return None
    m0 = msgs[0]
    post = None
    if m0.get("direction") == "OUTBOUND":
        if m0.get("type") in ("COMMENT", "PRIVATE_REPLY") or m0.get("status") == "FAILED":
            return None
        origen = "bienvenida" if "bienvenida" in (m0.get("content") or "").lower() else "saludo"
    elif m0.get("type") == "COMMENT":
        origen = "comentario"
        post = codigo_post((m0.get("comment") or {}).get("post_url"))
    else:
        origen = "mensaje"
    t0 = m0.get("sent_at") or ""
    conversan = origen == "mensaje" or any(
        m.get("direction") == "INBOUND" and m.get("type") != "COMMENT" and (m.get("sent_at") or "") > t0
        for m in msgs[1:]
    )
    return {"dia": dia_madrid(t0), "origen": origen, "post": post, "conversan": conversan,
            "contacto": conv.get("contact_id")}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--conv", nargs="+", required=True)
    ap.add_argument("--final", nargs="*", default=[])
    ap.add_argument("--datos", nargs="*", default=[])
    ap.add_argument("--dias", nargs="+", required=True)
    ap.add_argument("--ahora", default=datetime.now(MAD).isoformat(timespec="seconds"))
    a = ap.parse_args()

    convs = {}
    for p in a.conv:
        for c in cargar(p).get("conversations", []):
            convs[c["conversation_id"]] = c
    final, datos = ids_contactos(a.final), ids_contactos(a.datos)
    dias = set(a.dias)

    embudo = {d: {"fecha": d, "conversaciones_revisadas": 0} for d in dias}
    for d in dias:
        for o in ORIGENES:
            for k in ("entran", "conversan", "final", "datos"):
                embudo[d][f"{o}_{k}"] = 0
        embudo[d]["ids"] = {o: [] for o in ORIGENES}
    contenido = defaultdict(lambda: {"entran": 0, "conversan": 0, "final": 0, "datos": 0, "ids": []})
    vistos = set()

    for c in convs.values():
        r = clasificar(c)
        if not r or r["dia"] not in dias:
            continue
        e = embudo[r["dia"]]
        e["conversaciones_revisadas"] += 1
        clave = (r["dia"], r["origen"], r["contacto"])
        if clave in vistos:  # una persona cuenta una vez por día y origen
            continue
        vistos.add(clave)
        o, cid = r["origen"], r["contacto"]
        e[f"{o}_entran"] += 1
        llega, da = cid in final, cid in datos
        if r["conversan"]:
            e[f"{o}_conversan"] += 1
            e["ids"][o].append(cid)
        e[f"{o}_final"] += llega
        e[f"{o}_datos"] += da
        if o == "comentario" and r["post"]:
            p = contenido[(r["post"], r["dia"])]
            p["entran"] += 1
            p["conversan"] += r["conversan"]
            p["final"] += llega
            p["datos"] += da
            if r["conversan"]:
                p["ids"].append(cid)

    writes = []
    for d in sorted(dias):
        doc = dict(embudo[d], calculado_en=a.ahora)
        writes.append({"op": "set", "collection": "data/metricas/embudo", "doc_id": d, "data": doc})
    for (post, d), v in sorted(contenido.items()):
        writes.append({"op": "set", "collection": "data/metricas/contenido", "doc_id": f"{post}_{d}",
                       "data": dict(v, post=post, fecha=d, calculado_en=a.ahora)})
    json.dump(writes, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()
