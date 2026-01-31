import streamlit as st
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

st.set_page_config(
    page_title="CS Archive",
    page_icon="📚",
    layout="wide"
)

st.sidebar.title("📁 CS Archive")

# ------------------ helpers ------------------

# ------------------ sidebar ------------------

# Get all directories in the base folder
all_dirs = [d for d in os.listdir(BASE_DIR) if os.path.isdir(os.path.join(BASE_DIR, d))]

# Filter out ignored directories
ignore_set = {"scripts", ".git", "__pycache__", ".streamlit"}
sections = sorted([d for d in all_dirs if d not in ignore_set])

# If no sections found (fallback)
if not sections:
    st.sidebar.warning("No sections found!")
    sections = ["general"]

section = st.sidebar.selectbox("Select Section", sections)

section_path = os.path.join(BASE_DIR, section)

# ------------------ main ------------------

st.title(section.replace("_", " ").title())

courses = list_dirs(section_path)

if not courses:
    st.info("No courses found yet.")
else:
    cols = st.columns(3)
    for i, course in enumerate(courses):
        with cols[i % 3]:
            st.markdown(f"### 📘 {course.replace('_', ' ').title()}")

            categories = list_dirs(os.path.join(section_path, course))
            for cat in categories:
                st.write(f"• {cat.replace('_', ' ').title()}")
