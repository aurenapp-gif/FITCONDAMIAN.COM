#!/usr/bin/env python3
"""Guarda en ficheros las respuestas de una herramienta MCP leídas del registro de esta sesión de Claude Code.

Las respuestas grandes ya se guardan solas en ficheros; las pequeñas vuelven en línea. Este script las saca
del registro (.jsonl) para poder pasarlas a los scripts del panel sin copiarlas a mano.

Uso: extraer_resultados.py --herramienta mcp__ninjo__list_schedules --salida carpeta [--ultimas 5]
Escribe carpeta/<herramienta>_<n>.json con el texto de cada respuesta (la más antigua primero).
Si la respuesta se guardó en un fichero aparte, copia ese fichero.
"""
import argparse, glob, json, os, re, shutil

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--herramienta", required=True)
    ap.add_argument("--salida", required=True)
    ap.add_argument("--ultimas", type=int, default=1)
    ap.add_argument("--registro", default=None)
    a = ap.parse_args()
    reg = a.registro or max(glob.glob(os.path.expanduser("~/.claude/projects/*/*.jsonl")), key=os.path.getmtime)
    usos, resultados = {}, []
    for linea in open(reg):
        try:
            e = json.loads(linea)
        except ValueError:
            continue
        cont = (e.get("message") or {}).get("content")
        if not isinstance(cont, list):
            continue
        for b in cont:
            if b.get("type") == "tool_use":
                usos[b.get("id")] = b.get("name")
            elif b.get("type") == "tool_result" and usos.get(b.get("tool_use_id")) == a.herramienta:
                c = b.get("content")
                txt = c if isinstance(c, str) else "".join(x.get("text", "") for x in (c or []) if isinstance(x, dict))
                resultados.append(txt)
    os.makedirs(a.salida, exist_ok=True)
    nombre = a.herramienta.split("__")[-1]
    for i, txt in enumerate(resultados[-a.ultimas:]):
        destino = os.path.join(a.salida, f"{nombre}_{i}.json")
        m = re.search(r"Output has been saved to (\S+\.txt)", txt)
        if m and os.path.exists(m.group(1)):
            shutil.copy(m.group(1), destino)
        else:
            with open(destino, "w") as f:
                f.write(txt)
        print(destino)

if __name__ == "__main__":
    main()
