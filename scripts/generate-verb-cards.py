#!/usr/bin/env python3
"""Build the bundled flashcard deck from a frequency list and FreeDict."""

from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET


class VerbListParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_ordered_list = 0
        self.in_item = False
        self.current = []
        self.items = []

    def handle_starttag(self, tag, attrs):
        if tag == "ol":
            self.in_ordered_list += 1
        elif tag == "li" and self.in_ordered_list:
            self.in_item = True
            self.current = []

    def handle_endtag(self, tag):
        if tag == "li" and self.in_item:
            value = "".join(self.current).strip().removeprefix("[").removesuffix("]")
            # The published list contains one visibly empty item at rank 218.
            # Fill that gap with a common everyday verb that is otherwise absent.
            self.items.append(value or "cozinhar")
            self.in_item = False
        elif tag == "ol" and self.in_ordered_list:
            self.in_ordered_list -= 1

    def handle_data(self, data):
        if self.in_item:
            self.current.append(data)


OVERRIDES = {
    "ser": "быть", "ter": "иметь", "estar": "находиться; быть", "poder": "мочь",
    "fazer": "делать", "ir": "идти; ехать", "haver": "иметься; происходить", "dizer": "говорить; сказать",
    "dar": "давать", "ver": "видеть", "saber": "знать; уметь", "querer": "хотеть",
    "ficar": "оставаться; становиться", "dever": "быть должным", "passar": "проходить; проводить",
    "vir": "приходить", "chegar": "прибывать; доходить", "falar": "говорить", "deixar": "оставлять; позволять",
    "encontrar": "находить; встречать", "levar": "нести; отвозить", "começar": "начинать",
    "partir": "уезжать; отправляться", "pensar": "думать", "parecer": "казаться", "apresentar": "представлять",
    "olhar": "смотреть", "tornar": "делать; становиться", "sair": "выходить", "voltar": "возвращаться",
    "conseguir": "суметь; добиться", "achar": "находить; считать", "existir": "существовать",
    "sentir": "чувствовать", "entrar": "входить", "chamar": "звать; называть", "conhecer": "знать; знакомиться",
    "considerar": "считать; рассматривать", "pôr": "класть; ставить", "continuar": "продолжать",
    "viver": "жить", "ouvir": "слышать; слушать", "tomar": "брать; принимать", "acabar": "заканчивать",
    "receber": "получать", "perder": "терять", "andar": "ходить", "trabalhar": "работать",
    "criar": "создавать; воспитывать", "pedir": "просить; заказывать", "seguir": "следовать",
    "contar": "считать; рассказывать", "acontecer": "происходить", "afirmar": "утверждать",
    "tratar": "обращаться; лечить", "esperar": "ждать; надеяться", "gostar": "нравиться; любить",
    "usar": "использовать", "manter": "сохранять; поддерживать", "realizar": "осуществлять",
    "abrir": "открывать", "escrever": "писать", "permitir": "разрешать", "ocorrer": "происходить",
    "mostrar": "показывать", "lembrar": "помнить; напоминать", "trazer": "приносить", "procurar": "искать",
    "morrer": "умирать", "tentar": "пытаться", "formar": "образовывать", "aparecer": "появляться",
    "incluir": "включать", "cair": "падать", "correr": "бежать", "ganhar": "зарабатывать; выигрывать",
    "surgir": "возникать", "nascer": "рождаться", "pagar": "платить", "representar": "представлять",
    "produzir": "производить", "explicar": "объяснять", "comer": "есть", "beber": "пить",
    "dormir": "спать", "ler": "читать", "estudar": "учиться; изучать", "fechar": "закрывать",
    "cozinhar": "готовить еду",
}

BASIC = {
    "ser", "ter", "estar", "poder", "fazer", "ir", "dizer", "dar", "ver", "saber", "querer",
    "vir", "falar", "olhar", "sair", "entrar", "viver", "ouvir", "andar", "trabalhar", "comer",
    "beber", "dormir", "ler", "escrever", "estudar", "abrir", "fechar", "gostar", "correr",
}


def translate_batch(words):
    marked = "\n".join(f"{word} (verbo)" for word in words)
    payload = urllib.parse.urlencode({
        "client": "gtx", "sl": "pt", "tl": "ru", "dt": "t", "q": marked,
    }).encode()
    request = urllib.request.Request("https://translate.googleapis.com/translate_a/single", data=payload)
    with urllib.request.urlopen(request, timeout=45) as response:
        data = json.load(response)
    translated = "".join(part[0] for part in data[0]).splitlines()
    if len(translated) != len(words):
        raise RuntimeError(f"Translation count mismatch: {len(words)} != {len(translated)}")
    return [re.sub(r"\s*\(глагол\)\s*$", "", value, flags=re.I).strip() for value in translated]


def main():
    if len(sys.argv) != 4:
        raise SystemExit("usage: generate-verb-cards.py FREQUENCY_HTML RUS_POR_TEI OUTPUT_TS")
    frequency_path, dictionary_path, output_path = map(Path, sys.argv[1:])

    parser = VerbListParser()
    parser.feed(frequency_path.read_text(encoding="utf-8"))
    verbs = parser.items[:1000]
    if len(verbs) != 1000:
        raise RuntimeError(f"Expected 1000 verbs, got {len(verbs)}")

    namespace = {"tei": "http://www.tei-c.org/ns/1.0"}
    wanted = set(verbs)
    dictionary = {}
    root = ET.parse(dictionary_path).getroot()
    for entry in root.findall(".//tei:entry", namespace):
        russian = entry.findtext("tei:form/tei:orth", default="", namespaces=namespace).strip()
        pos = entry.findtext("tei:gramGrp/tei:pos", default="", namespaces=namespace).strip()
        if pos != "v" or not russian:
            continue
        for quote in entry.findall('.//tei:cit[@type="trans"]/tei:quote', namespace):
            portuguese = "".join(quote.itertext()).strip()
            if portuguese in wanted:
                dictionary.setdefault(portuguese, [])
                if russian not in dictionary[portuguese]:
                    dictionary[portuguese].append(russian)

    translations = {}
    missing = []
    for verb in verbs:
        if verb in OVERRIDES:
            translations[verb] = OVERRIDES[verb]
        elif dictionary.get(verb):
            translations[verb] = "; ".join(dictionary[verb][:2])
        else:
            missing.append(verb)

    for start in range(0, len(missing), 45):
        batch = missing[start:start + 45]
        for verb, translated in zip(batch, translate_batch(batch)):
            translations[verb] = translated
        print(f"translated {min(start + 45, len(missing))}/{len(missing)}", file=sys.stderr)

    cards = [
        {"id": f"v{rank:04}", "pt": verb, "ru": translations[verb], "rank": rank, "basic": verb in BASIC}
        for rank, verb in enumerate(verbs, start=1)
    ]
    output = """// Generated from the Corpus do Português frequency list and FreeDict rus-por.\n// FreeDict translations are CC BY-SA 3.0; see https://freedict.org/.\n\nexport type VerbCard = { id: string; pt: string; ru: string; rank: number; basic: boolean };\n\nexport const verbCards: VerbCard[] = """
    output += json.dumps(cards, ensure_ascii=False, separators=(",", ":"))
    output += ";\n"
    output_path.write_text(output, encoding="utf-8")


if __name__ == "__main__":
    main()
