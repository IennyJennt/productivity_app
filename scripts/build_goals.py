"""Writes src/data/goals.json from the outlines below.

Each short-term goal has a date window; its tasks' due dates are spread
evenly across that window. Ids are fixed slugs so the app imports each item
once. To change an item that is already in the app, give it a new id.

Run: python3 scripts/build_goals.py
"""
import json, re
from datetime import date

def d(s): return date.fromisoformat(s)

def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:48]

def spread(start, end, n):
    span = (end - start).days
    return [date.fromordinal(start.toordinal() + round(span * (i + 1) / n)) for i in range(n)]

def goal(gid, title, description, stgs, target=None, focus=None, paused=False):
    out = {"id": gid, "title": title, "description": description, "shortTermGoals": []}
    if target: out["targetDate"] = target
    if focus: out["dailyFocusMinutes"] = focus
    if paused: out["paused"] = True
    for st in stgs:
        sid = f"{gid}/{slug(st['title'])}"
        tasks = st["tasks"]
        dues = spread(d(st["start"]), d(st["end"]), len(tasks)) if "start" in st else [None] * len(tasks)
        s = {"id": sid, "title": st["title"], "tasks": []}
        if "end" in st: s["targetDate"] = st["end"]
        for (t, mins), due in zip(tasks, dues):
            task = {"id": f"{sid}/{slug(t)}", "title": t, "estimateMinutes": mins}
            if due: task["dueDate"] = due.isoformat()
            s["tasks"].append(task)
        out["shortTermGoals"].append(s)
    return out

goals = [
    goal("la-fund", "Save for my first 3 months in LA",
         "$7,620 total: rent $1,400 × 3 = $4,200, food $480 × 3 = $1,440, "
         "entertainment $500 × 3 = $1,500, phone and internet $160 × 3 = $480.",
         focus=30, stgs=[
        {"title": "Set up the LA fund", "tasks": [
            ("Open a separate high-yield savings account just for the LA fund", 30),
            ("Work out how much you can save each month and when you plan to move", 45),
            ("Set up an automatic transfer on payday", 20),
        ]},
        {"title": "Save 3 months of rent ($4,200)", "tasks": [
            ("Reach $1,400 (month 1 rent)", 15),
            ("Reach $2,800 (month 2 rent)", 15),
            ("Reach $4,200 (month 3 rent)", 15),
        ]},
        {"title": "Save 3 months of living costs ($3,420)", "tasks": [
            ("Reach $5,640 total (+ $1,440 for food)", 15),
            ("Reach $7,140 total (+ $1,500 for entertainment)", 15),
            ("Reach $7,620 total (+ $480 for phone and internet)", 15),
        ]},
    ]),
    goal("bengal-cat", "Save $5,000 before getting a Bengal cat",
         "Have $5,000 saved before buying. Do the research tasks while you save.",
         focus=30, stgs=[
        {"title": "Set up the cat fund", "tasks": [
            ("Make a separate savings bucket for the cat fund", 20),
            ("Decide how much of each month's savings goes here vs. the LA fund", 20),
        ]},
        {"title": "Research before buying", "tasks": [
            ("Check your LA apartment's pet policy and pet deposit", 30),
            ("Find reputable, registered Bengal breeders and their waitlists", 60),
            ("Budget monthly cat costs: food, litter, vet, insurance", 45),
        ]},
        {"title": "Save $5,000", "tasks": [
            ("Reach $1,250", 15),
            ("Reach $2,500", 15),
            ("Reach $3,750", 15),
            ("Reach $5,000", 15),
        ]},
    ]),
    goal("career", "Get hired in robotics, mechatronics or physical AI",
         "Target roles: product engineer, robotics engineer, physical AI / mechatronics. "
         "Build a portfolio site and 4 projects that show mechanical design, electronics, "
         "controls, vision/AI and product thinking, then apply from March.",
         target="2027-05-31", stgs=[
        {"title": "Launch portfolio website v1", "start": "2026-11-02", "end": "2026-11-22", "tasks": [
            ("Pick a site builder or template and a domain name", 60),
            ("Write the About section and add your resume PDF", 120),
            ("Make a project page template: problem, design, build, results, next steps", 60),
            ("Add the origami robot and bracelet research (check what you can share publicly)", 180),
            ("Publish the site and link it from LinkedIn and GitHub", 60),
        ]},
        {"title": "Build a servo robot arm", "start": "2026-11-23", "end": "2027-01-17", "tasks": [
            ("Write specs: degrees of freedom, reach, payload, servos, controller", 120),
            ("Order servos, controller board, servo driver and power supply", 60),
            ("Model the arm in CAD as an assembly with joint limits", 360),
            ("3D print and assemble the arm", 360),
            ("Wire the servos, power and controller", 180),
            ("Write joint control firmware and a simple control panel", 240),
            ("Implement inverse kinematics to reach x, y, z targets", 360),
            ("Program a pick-and-place routine", 180),
            ("Film a demo video and photograph the build", 120),
            ("Write the project page: design choices, what failed, results", 180),
        ]},
        {"title": "Mechanical CAD mini-series", "start": "2026-11-30", "end": "2027-02-07", "tasks": [
            ("Design a print-in-place compliant gripper", 240),
            ("Design a planetary gearbox for a servo or stepper", 240),
            ("Design a snap-fit electronics enclosure with notes on manufacturability", 180),
            ("Make renders and engineering drawings and add the series to your site", 180),
        ]},
        {"title": "Give the arm vision (physical AI)", "start": "2027-01-18", "end": "2027-03-14", "tasks": [
            ("Mount a camera and calibrate it to the arm's coordinates", 240),
            ("Detect objects with OpenCV, then try a small detection model", 360),
            ("Pick up an object wherever the camera sees it", 360),
            ("Stretch: record demonstrations and train a small imitation-learning policy", 480),
            ("Film the demo and write the project page", 180),
        ]},
        {"title": "Simulate the arm in ROS 2", "start": "2027-02-08", "end": "2027-04-04", "tasks": [
            ("Work through the ROS 2 beginner tutorials", 360),
            ("Write a URDF model of your arm and view it in RViz", 240),
            ("Plan and run motions in simulation with MoveIt", 360),
            ("Add a short write-up to the arm's project page", 60),
        ]},
        {"title": "Design a small product end to end", "start": "2027-03-15", "end": "2027-04-25", "tasks": [
            ("Pick a real user problem and write a one-page product brief", 120),
            ("Prototype the electronics on a breadboard", 240),
            ("Design a custom PCB in KiCad and order it", 360),
            ("Design a manufacturable enclosure (draft angles, tolerances, snap fits)", 300),
            ("Build 2 or 3 iterations and test them with a few people", 360),
            ("Write the bill of materials with costs and a short manufacturing write-up", 120),
            ("Write the project page with process photos", 180),
        ]},
        {"title": "Job search", "start": "2027-03-01", "end": "2027-05-31", "tasks": [
            ("Tailor your resume for product, robotics and mechatronics roles", 120),
            ("List 30 target companies: robotics, hardware startups, physical AI labs", 120),
            ("Update LinkedIn and pin your projects on GitHub", 60),
            ("Message 5 engineers at target companies for short chats", 60),
            ("Apply to your first 10 roles", 180),
            ("Practice a 5-minute walkthrough of the robot arm project", 60),
            ("Message 5 more engineers at target companies", 60),
            ("Review mechanics, controls and coding basics for interviews", 240),
            ("Apply to 10 more roles", 180),
            ("Follow up on applications and conversations", 60),
        ]},
    ]),
]

with open("src/data/goals.json", "w") as f:
    json.dump(goals, f, indent=2, ensure_ascii=False)
    f.write("\n")
ids = [g["id"] for g in goals] + [s["id"] for g in goals for s in g["shortTermGoals"]] + [t["id"] for g in goals for s in g["shortTermGoals"] for t in s["tasks"]]
assert len(ids) == len(set(ids)), "duplicate ids"
print(len(goals), "goals,", sum(len(s["tasks"]) for g in goals for s in g["shortTermGoals"]), "tasks")
for g in goals:
    print(g["id"], round(sum(t["estimateMinutes"] for s in g["shortTermGoals"] for t in s["tasks"]) / 60), "h")
