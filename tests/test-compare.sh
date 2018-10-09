#!/usr/bin/env bash

/usr/bin/compare -metric AE -fuzz 10% -highlight-color red original.png modified.png diff_modified.png
echo $?
/usr/bin/compare -metric AE -fuzz 10% -highlight-color red original.png original.png diff_identical.png
echo $?
/usr/bin/compare -metric AE -fuzz 80% -highlight-color red original.png modified.png diff_clobber.png
echo $?
