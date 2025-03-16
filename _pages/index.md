---
layout: page
title: Home
id: home
permalink: /
---

# Welcome!🤓

This site is here to help with everything from quick references to in-depth tutorials on engineering, math, physics, computer science, and more. Whether you're looking to brush up on a concept or dive into a new topic, you'll find clear explanations and useful resources to guide you along the way.

Take a look around and explore the content!


<strong>Recently updated notes</strong>

<ul>
  {% assign recent_notes = site.notes | sort: "last_modified_at_timestamp" | reverse %}
  {% for note in recent_notes limit: 5 %}
    <li>
      {{ note.last_modified_at | date: "%Y-%m-%d" }} — <a class="internal-link" href="{{ site.baseurl }}{{ note.url }}">{{ note.title }}</a>
    </li>
  {% endfor %}
</ul>

<style>
  .wrapper {
    max-width: 46em;
  }
</style>
