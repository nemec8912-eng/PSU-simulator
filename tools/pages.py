"""Создаёт HTML-страницы всех плат из общего шаблона (index.html = Samsung).
Запуск из корня проекта: python3 tools/pages.py"""
import re
BOARDS=[
 dict(id="samsung",file="index.html",nav="Samsung BN44 (ТВ)"),
 dict(id="adapter",file="adapter.html",nav="Адаптер 12 В"),
 dict(id="led",file="led.html",nav="LED-подсветка ТВ",title="LED-подсветка ТВ",h1="Драйвер LED-подсветки телевизора: полная схема",
   lead="Повышающий преобразователь 24 → 110 В и два канала тока по 350 мА для линеек светодиодов. Самая частая поломка телевизоров: звук есть, а изображения нет. Точки на проводах — это ток. Выведите любую деталь из строя и посмотрите, как гаснет подсветка.",
   btn="Пульт: включить ТВ",mains="Питание 24 В: есть",card="Что видно на экране",ledT="индикатор ТВ",
   foot="Схема собрана по типовой архитектуре драйверов подсветки (boost + линейные ключи тока, контроллеры OZ9957/MP3394). Номиналы типичные, на конкретной плате они отличаются."),
 dict(id="amp",file="amp.html",nav="Усилитель звука",title="Усилитель на TDA7294",h1="Усилитель звука на TDA7294: полная схема",
   lead="Сетевой трансформатор, выпрямитель ±35 В и микросхема TDA7294 с динамиком 8 Ом. Неисправности слышны: фон, хрип, свист, тишина — и видны на осциллографе. Выведите любую деталь из строя и послушайте, что изменится.",
   btn="Музыка: включить",mains="Вилка в розетке",card="Что слышно из динамика",ledT="индикатор питания",
   foot="Схема собрана по типовому включению TDA7294 из документации производителя (усиление 33, MUTE/STBY через RC, цепь Цобеля). Номиналы типичные."),
]
EXTRA=[dict(file="extra/psu-basics.html",nav="Основы: блок-схема")]
def nav(cur):
    items=[f'<a href="{b["file"]}"'+(' aria-current="page"' if b["id"]==cur else '')+f'>{b["nav"]}</a>' for b in BOARDS]
    items+=[f'<a href="{e["file"]}">{e["nav"]}</a>' for e in EXTRA]
    return '<nav class="boards" aria-label="Платы">'+"".join(items)+'</nav>'
tpl=open("index.html",encoding="utf-8").read()
tpl=re.sub(r'<nav class="boards".*?</nav>','{NAV}',tpl,flags=re.S)
for b in BOARDS:
    if b["id"] in("samsung","adapter"):
        s=open(b["file"],encoding="utf-8").read()
        s=re.sub(r'<nav class="boards".*?</nav>',nav(b["id"]),s,flags=re.S)
    else:
        s=tpl.replace("{NAV}",nav(b["id"]))
        s=s.replace("boards/samsung/",f'boards/{b["id"]}/')
        s=re.sub(r"<title>.*?</title>",f'<title>{b["title"]}</title>',s)
        s=re.sub(r"<h1>.*?</h1>",f'<h1>{b["h1"]}</h1>',s)
        s=re.sub(r'<p class="lead">.*?</p>',f'<p class="lead">{b["lead"]}</p>',s,flags=re.S)
        s=re.sub(r'<button id="bTv" type="button">.*?</button>',f'<button id="bTv" type="button">{b["btn"]}</button>',s)
        s=re.sub(r'<button id="bMains" type="button" class="on">.*?</button>',f'<button id="bMains" type="button" class="on">{b["mains"]}</button>',s)
        s=re.sub(r"<h3>Что происходит с телевизором</h3>",f'<h3>{b["card"]}</h3>',s)
        s=re.sub(r'<span id="ledT">.*?</span>',f'<span id="ledT">{b["ledT"]}</span>',s)
        s=re.sub(r'<p class="hint">Схема собрана по типовой.*?</p>',f'<p class="hint">{b["foot"]}</p>',s,flags=re.S)
        s=s.replace("Затем включите ТВ пультом.","Затем включите устройство.")
    open(b["file"],"w",encoding="utf-8").write(s)
    print("ok",b["file"])
