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
    lines.append("flowchart LR")

    id_d1 = safe_id(d1)
    lines.append(f'    {id_d1}["{d1}"]')

    # ブロック内でラベル→IDの対応を管理
    label_to_id: dict[str, str] = {}

    def get_or_create_node(label: str, id_key: str) -> str:
        """同じラベルが既出ならそのIDを返す。なければ新規作成してlinesに追加。"""
        if label in label_to_id:
            return label_to_id[label]
        node_id = safe_id(id_key)
        lines.append(f'    {node_id}["{label}"]')
        label_to_id[label] = node_id
        return node_id

    for d2, d3s in tree[d1].items():
        id_d2 = get_or_create_node(d2, d1 + d2)
        lines.append(f"    {id_d1} --> {id_d2}")

        for d3 in sorted(d3s):
            if d3:
                id_d3 = get_or_create_node(d3, d1 + d2 + d3)
                lines.append(f"    {id_d2} --> {id_d3}")

    block = f"### {d1}\n```mermaid\n" + "\n".join(lines) + "\n```\n"
    output_blocks.append(block)

with open("README.md", "w", encoding="utf-8") as o:
    print("\n".join(output_blocks), file=o)
