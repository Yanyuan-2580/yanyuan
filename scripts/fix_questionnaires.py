#!/usr/bin/env python3
"""扩充问卷题量至标准版 + 修正计分规则"""
import json
import mysql.connector

conn = mysql.connector.connect(
    host='127.0.0.1', port=3306, user='root',
    password='123456', database='mental_health_db'
)
cursor = conn.cursor()

# ====== SAS 焦虑自评量表 — 20题标准版 ======
sas_questions = [
    {"id":1,"text":"我觉得比平时容易紧张和着急","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":2,"text":"我无缘无故地感到害怕","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":3,"text":"我容易心里烦乱或觉得惊恐","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":4,"text":"我觉得我可能将要发疯","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":5,"text":"我觉得一切都很好，也不会发生什么不幸","options":[{"value":1,"label":"绝大部分或全部时间","score":4},{"value":2,"label":"相当多时间","score":3},{"value":3,"label":"少部分时间","score":2},{"value":4,"label":"没有或很少时间","score":1}]},
    {"id":6,"text":"我手脚发抖打颤","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":7,"text":"我因为头痛、颈痛和背痛而苦恼","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":8,"text":"我感觉容易衰弱和疲乏","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":9,"text":"我觉得心平气和，并且容易安静坐着","options":[{"value":1,"label":"绝大部分或全部时间","score":4},{"value":2,"label":"相当多时间","score":3},{"value":3,"label":"少部分时间","score":2},{"value":4,"label":"没有或很少时间","score":1}]},
    {"id":10,"text":"我觉得心跳得很快","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":11,"text":"我因为一阵阵头晕而苦恼","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":12,"text":"我有过晕倒发作，或觉得要晕倒似的","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":13,"text":"我吸气呼气都感到很容易","options":[{"value":1,"label":"绝大部分或全部时间","score":4},{"value":2,"label":"相当多时间","score":3},{"value":3,"label":"少部分时间","score":2},{"value":4,"label":"没有或很少时间","score":1}]},
    {"id":14,"text":"我的手脚麻木和刺痛","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":15,"text":"我因为胃痛和消化不良而苦恼","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":16,"text":"我常常要小便","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":17,"text":"我的手脚常常是干燥温暖的","options":[{"value":1,"label":"绝大部分或全部时间","score":4},{"value":2,"label":"相当多时间","score":3},{"value":3,"label":"少部分时间","score":2},{"value":4,"label":"没有或很少时间","score":1}]},
    {"id":18,"text":"我脸红发热","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":19,"text":"我容易入睡并且一夜睡得很好","options":[{"value":1,"label":"绝大部分或全部时间","score":4},{"value":2,"label":"相当多时间","score":3},{"value":3,"label":"少部分时间","score":2},{"value":4,"label":"没有或很少时间","score":1}]},
    {"id":20,"text":"我做噩梦","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
]
sas_rules = [{"min":20,"max":35,"level":"low","label":"轻度焦虑"},{"min":36,"max":49,"level":"moderate","label":"中度焦虑"},{"min":50,"max":80,"level":"high","label":"重度焦虑"}]

# ====== SDS 抑郁自评量表 — 20题标准版 ======
sds_questions = [
    {"id":1,"text":"我觉得闷闷不乐，情绪低沉","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":2,"text":"我觉得一天之中早晨最好","options":[{"value":1,"label":"绝大部分或全部时间","score":4},{"value":2,"label":"相当多时间","score":3},{"value":3,"label":"少部分时间","score":2},{"value":4,"label":"没有或很少时间","score":1}]},
    {"id":3,"text":"我一阵阵哭出来或觉得想哭","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":4,"text":"我晚上睡眠不好","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":5,"text":"我吃得跟平常一样多","options":[{"value":1,"label":"绝大部分或全部时间","score":4},{"value":2,"label":"相当多时间","score":3},{"value":3,"label":"少部分时间","score":2},{"value":4,"label":"没有或很少时间","score":1}]},
    {"id":6,"text":"我与异性密切接触时和以往一样感到愉快","options":[{"value":1,"label":"绝大部分或全部时间","score":4},{"value":2,"label":"相当多时间","score":3},{"value":3,"label":"少部分时间","score":2},{"value":4,"label":"没有或很少时间","score":1}]},
    {"id":7,"text":"我发觉我的体重在下降","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":8,"text":"我有便秘的苦恼","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":9,"text":"我心跳比平时快","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":10,"text":"我无缘无故地感到疲乏","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":11,"text":"我的头脑跟平常一样清楚","options":[{"value":1,"label":"绝大部分或全部时间","score":4},{"value":2,"label":"相当多时间","score":3},{"value":3,"label":"少部分时间","score":2},{"value":4,"label":"没有或很少时间","score":1}]},
    {"id":12,"text":"我觉得经常做的事情并没有困难","options":[{"value":1,"label":"绝大部分或全部时间","score":4},{"value":2,"label":"相当多时间","score":3},{"value":3,"label":"少部分时间","score":2},{"value":4,"label":"没有或很少时间","score":1}]},
    {"id":13,"text":"我觉得不安而平静不下来","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":14,"text":"我对将来抱有希望","options":[{"value":1,"label":"绝大部分或全部时间","score":4},{"value":2,"label":"相当多时间","score":3},{"value":3,"label":"少部分时间","score":2},{"value":4,"label":"没有或很少时间","score":1}]},
    {"id":15,"text":"我比平常容易生气激动","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":16,"text":"我觉得做出决定是容易的","options":[{"value":1,"label":"绝大部分或全部时间","score":4},{"value":2,"label":"相当多时间","score":3},{"value":3,"label":"少部分时间","score":2},{"value":4,"label":"没有或很少时间","score":1}]},
    {"id":17,"text":"我觉得自己是个有用的人，有人需要我","options":[{"value":1,"label":"绝大部分或全部时间","score":4},{"value":2,"label":"相当多时间","score":3},{"value":3,"label":"少部分时间","score":2},{"value":4,"label":"没有或很少时间","score":1}]},
    {"id":18,"text":"我的生活过得很有意思","options":[{"value":1,"label":"绝大部分或全部时间","score":4},{"value":2,"label":"相当多时间","score":3},{"value":3,"label":"少部分时间","score":2},{"value":4,"label":"没有或很少时间","score":1}]},
    {"id":19,"text":"我认为如果我死了别人会生活得好些","options":[{"value":1,"label":"没有或很少时间","score":1},{"value":2,"label":"少部分时间","score":2},{"value":3,"label":"相当多时间","score":3},{"value":4,"label":"绝大部分或全部时间","score":4}]},
    {"id":20,"text":"常感兴趣的事我仍然照样感兴趣","options":[{"value":1,"label":"绝大部分或全部时间","score":4},{"value":2,"label":"相当多时间","score":3},{"value":3,"label":"少部分时间","score":2},{"value":4,"label":"没有或很少时间","score":1}]},
]
sds_rules = [{"min":20,"max":35,"level":"low","label":"轻度抑郁"},{"min":36,"max":49,"level":"moderate","label":"中度抑郁"},{"min":50,"max":80,"level":"high","label":"重度抑郁"}]

# ====== PSS 压力感知量表 — 10题标准版 ======
pss_questions = [
    {"id":1,"text":"在过去一个月里，你因为发生意外的事情而感到心烦意乱的频率？","options":[{"value":1,"label":"从来没有","score":0},{"value":2,"label":"几乎没有","score":1},{"value":3,"label":"有时","score":2},{"value":4,"label":"经常","score":3},{"value":5,"label":"非常频繁","score":4}]},
    {"id":2,"text":"在过去一个月里，你感到无法控制生活中重要事情的频率？","options":[{"value":1,"label":"从来没有","score":0},{"value":2,"label":"几乎没有","score":1},{"value":3,"label":"有时","score":2},{"value":4,"label":"经常","score":3},{"value":5,"label":"非常频繁","score":4}]},
    {"id":3,"text":"在过去一个月里，你感到紧张和压力的频率？","options":[{"value":1,"label":"从来没有","score":0},{"value":2,"label":"几乎没有","score":1},{"value":3,"label":"有时","score":2},{"value":4,"label":"经常","score":3},{"value":5,"label":"非常频繁","score":4}]},
    {"id":4,"text":"在过去一个月里，你对自己处理问题的能力感到自信的频率？","options":[{"value":1,"label":"非常频繁","score":4},{"value":2,"label":"经常","score":3},{"value":3,"label":"有时","score":2},{"value":4,"label":"几乎没有","score":1},{"value":5,"label":"从来没有","score":0}]},
    {"id":5,"text":"在过去一个月里，你感到事情按照你的意愿发展的频率？","options":[{"value":1,"label":"非常频繁","score":4},{"value":2,"label":"经常","score":3},{"value":3,"label":"有时","score":2},{"value":4,"label":"几乎没有","score":1},{"value":5,"label":"从来没有","score":0}]},
    {"id":6,"text":"在过去一个月里，你发现自己无法应对所有必须做的事情的频率？","options":[{"value":1,"label":"从来没有","score":0},{"value":2,"label":"几乎没有","score":1},{"value":3,"label":"有时","score":2},{"value":4,"label":"经常","score":3},{"value":5,"label":"非常频繁","score":4}]},
    {"id":7,"text":"在过去一个月里，你能够控制生活中的烦恼的频率？","options":[{"value":1,"label":"非常频繁","score":4},{"value":2,"label":"经常","score":3},{"value":3,"label":"有时","score":2},{"value":4,"label":"几乎没有","score":1},{"value":5,"label":"从来没有","score":0}]},
    {"id":8,"text":"在过去一个月里，你感到自己掌控局面的频率？","options":[{"value":1,"label":"非常频繁","score":4},{"value":2,"label":"经常","score":3},{"value":3,"label":"有时","score":2},{"value":4,"label":"几乎没有","score":1},{"value":5,"label":"从来没有","score":0}]},
    {"id":9,"text":"在过去一个月里，你因为事情超出你的控制而愤怒的频率？","options":[{"value":1,"label":"从来没有","score":0},{"value":2,"label":"几乎没有","score":1},{"value":3,"label":"有时","score":2},{"value":4,"label":"经常","score":3},{"value":5,"label":"非常频繁","score":4}]},
    {"id":10,"text":"在过去一个月里，你感到困难堆积如山而无法克服的频率？","options":[{"value":1,"label":"从来没有","score":0},{"value":2,"label":"几乎没有","score":1},{"value":3,"label":"有时","score":2},{"value":4,"label":"经常","score":3},{"value":5,"label":"非常频繁","score":4}]},
]
pss_rules = [{"min":0,"max":13,"level":"low","label":"压力较低"},{"min":14,"max":26,"level":"moderate","label":"压力中等"},{"min":27,"max":40,"level":"high","label":"压力较高"}]

# Update
for qid, questions, rules in [(1, sas_questions, sas_rules), (2, sds_questions, sds_rules), (3, pss_questions, pss_rules)]:
    qjson = json.dumps(questions, ensure_ascii=False)
    rjson = json.dumps(rules, ensure_ascii=False)
    cursor.execute(
        "UPDATE questionnaires SET questions = %s, scoringRules = %s WHERE id = %s",
        (qjson, rjson, qid)
    )

conn.commit()

# Verify
for qid in [1, 2, 3]:
    cursor.execute(
        "SELECT id, title, JSON_LENGTH(questions) as qcount, scoringRules FROM questionnaires WHERE id = %s",
        (qid,)
    )
    row = cursor.fetchone()
    rules = json.loads(row[3])
    rstr = ", ".join(f"{r['min']}-{r['max']}:{r['label']}" for r in rules)
    print(f"ID={row[0]}: {row[1]} | {row[2]}题 | 规则: {rstr}")

cursor.close()
conn.close()
print("\nDONE: SAS(20题) SDS(20题) PSS(10题) 评分规则已对齐")
