# Day1ごとに派生ツリーを個別mermaidとして生成（再実行）

import csv
from collections import defaultdict

csv_path = "./ナイトレイン 夜ボスプール - 一日目.csv"

tree = defaultdict(lambda: defaultdict(set))

with open(csv_path, encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader)
    for row in reader:
        if len(row) < 3:
            continue
        d1 = row[0].strip()
        d2 = row[1].strip()
        d3 = row[2].strip()
        if d1 and d2:
            tree[d1][d2].add(d3)

def safe_id(text):
    return "N_" + str(abs(hash(text)))

output_blocks = []

for d1 in tree.keys():
    lines = []
    lines.append("flowchart TB")
    
    id_d1 = safe_id(d1)
    lines.append(f'    {id_d1}["{d1}"]')
    
    for d2, d3s in tree[d1].items():
        id_d2 = safe_id(d1 + d2)
        lines.append(f'    {id_d2}["{d2}"]')
        lines.append(f"    {id_d1} --> {id_d2}")
        
        for d3 in sorted(d3s):
            if d3:
                id_d3 = safe_id(d1 + d2 + d3)
                lines.append(f'    {id_d3}["{d3}"]')
                lines.append(f"    {id_d2} --> {id_d3}")
    
    block = f"### {d1}\n```mermaid\n" + "\n".join(lines) + "\n```\n"
    output_blocks.append(block)

with open("README.md", "w", encoding="utf-8") as o:
    print("\n".join(output_blocks), file=o)
    