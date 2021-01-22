import os
import pathlib

import re

import functools
from django import template
from django.apps import apps

register = template.Library()


def get_depends(path):
    dir_path, _ = os.path.split(path)
    with open(path) as file:
        code = file.read()
        depends = set(re.findall('import.+from\s+[\'\"](.+)[\'\"];?', code))
        return [str(pathlib.Path(dir_path, depend).resolve()) for depend in depends]


@register.inclusion_tag('babel_scripts.html', name='render_babel_scripts')
def search_static_files(app, suffix='.jsx'):
    root = os.path.join(apps.get_app_config(app).path, 'static/')
    compose = {}
    for current, _, files in os.walk(root):
        for file in files:
            _, file_suffix = os.path.splitext(file)
            if file_suffix == suffix:
                path = os.path.join(current, file)
                compose[path] = get_depends(path)

    def sum_priority(path):
        return functools.reduce(
            lambda priority, depend: priority + sum_priority(depend), compose[path], len(compose[path]))

    results = [[path, sum_priority(path)] for path in compose]
    results.sort(key=lambda result: result[1])
    return {'files': [result[0][len(root):] for result in results]}
