#!/usr/bin/env python3
"""Convierte respuestas guardadas de Ninjo en los envíos para el panel de fitcondamian.com (/api/panel/sync).

Uso (cada opción es opcional; escribe un fichero JSON por envío en --salida):
  --embudo writes.json            salida de embudo_diario.py  → embudo.json y contenido.json
  --agendas f1.json [f2.json ...] respuestas de list_schedules (timezone Europe/Madrid), todas las páginas
  --perfil perfil.json            respuesta de get_instagram_profile
  --publicaciones posts.json      respuesta de get_instagram_posts
  --origenes 7=a.json 14=b.json 30=c.json 90=d.json   respuestas de get_agent_insights (sections ["sources"])
  --seguidores YYYY-MM-DD         fecha de la foto de seguidores (usa --perfil)
Cada fichero de salida es { "tipo": ..., "datos": ... } listo para: curl -X POST --data @fichero.
"""
import argparse, json, os, re

def cargar(p):
    with open(p) as f:
        return json.load(f)

def escribir(carpeta, tipo, datos):
    with open(os.path.join(carpeta, f"{tipo}.json"), "w") as f:
        json.dump({"tipo": tipo, "datos": datos}, f, ensure_ascii=False)
    print(tipo, len(datos) if hasattr(datos, "__len__") else "")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--salida", required=True)
    ap.add_argument("--embudo")
    ap.add_argument("--agendas", nargs="*")
    ap.add_argument("--perfil")
    ap.add_argument("--publicaciones")
    ap.add_argument("--origenes", nargs="*")
    ap.add_argument("--seguidores")
    a = ap.parse_args()
    os.makedirs(a.salida, exist_ok=True)

    if a.embudo:
        emb, cont = {}, {}
        for w in cargar(a.embudo):
            datos = w.get("data") or cargar(w["file_path"])
            if w["collection"].endswith("embudo"):
                emb[w["doc_id"]] = datos
            elif w["collection"].endswith("contenido"):
                cont[w["doc_id"]] = datos
        escribir(a.salida, "embudo", emb)
        escribir(a.salida, "contenido", cont)

    if a.agendas:
        filas = {}
        for p in a.agendas:
            for s in cargar(p).get("schedules", []):
                titulo = str(s.get("name") or "").split(" - ")[0].strip()
                nombre = titulo or " ".join(x for x in [s.get("first_name"), s.get("last_name")] if x and x != "Llamada Agendada")
                filas[s["schedule_id"]] = {
                    "id": s["schedule_id"], "contacto": s.get("contact_id") or "", "fecha": s.get("datetime"),
                    "reservada": s.get("created_at"), "estado": s.get("status"), "origen": s.get("source"),
                    "nombre": nombre, "instagram": s.get("instagram_username") or "", "telefono": s.get("phone_number") or "",
                    "setter": "sí" if s.get("agent_id") else "no",
                }
        escribir(a.salida, "agendas", list(filas.values()))

    if a.perfil:
        p = cargar(a.perfil)
        escribir(a.salida, "perfil", {"cuenta": p.get("username"), "seguidores": p["followers_count"], "publicaciones": p.get("media_count")})
        if a.seguidores:
            escribir(a.salida, "seguidores", {a.seguidores: {"fecha": a.seguidores, "seguidores": p["followers_count"], "publicaciones": p.get("media_count")}})

    if a.publicaciones:
        tipos = {"VIDEO": "Reel", "CAROUSEL_ALBUM": "Carrusel", "IMAGE": "Foto"}
        filas = []
        for p in cargar(a.publicaciones).get("posts", []):
            m = re.search(r"instagram\.com/(?:reel|p|tv)/([A-Za-z0-9_-]+)", p.get("permalink") or "")
            filas.append({"codigo": m.group(1) if m else str(p["id"]), "fecha": p.get("timestamp"),
                          "tipo": tipos.get(p.get("media_type"), p.get("media_type") or ""),
                          "texto": re.sub(r"\s+", " ", p.get("caption") or "")[:90], "enlace": p.get("permalink") or "",
                          "likes": int(p.get("like_count") or 0), "comentarios": int(p.get("comments_count") or 0)})
        escribir(a.salida, "publicaciones", filas)

    if a.origenes:
        nombres = {"Organic DM": "DM orgánico", "Comment": "Comentario", "Story Reply": "Respuesta a historia"}
        out = {}
        for par in a.origenes:
            dias, p = par.split("=", 1)
            out[dias] = [{"origen": nombres.get(s["source"], s["source"]), "conversaciones": int(s.get("total_conversations") or 0),
                          "agendas": int(s.get("bookings_sent") or 0)} for s in cargar(p).get("sources", [])]
        escribir(a.salida, "origenes", out)

if __name__ == "__main__":
    main()
