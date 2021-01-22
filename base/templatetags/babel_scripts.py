import os
from django import template
from django.apps import apps

register = template.Library()


@register.inclusion_tag('babel_scripts.html', name='render_babel_scripts')
def search_static_files(app, suffix='.jsx'):
    root = os.path.join(apps.get_app_config(app).path, 'static/')
    results = []
    for current, _, files in os.walk(root):
        for file in files:
            _, file_suffix = os.path.splitext(file)
            if file_suffix == suffix:
                results.append(os.path.join(current, file))
    results.sort(reverse=True)
    return {'files': [absolute[len(root):] for absolute in results]}
