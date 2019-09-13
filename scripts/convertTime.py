# -*- coding: utf-8 -*-
"""
@author: HoangHn
@install: please install dateparser first
"""
import sys,json,dateparser,datetime

if len(sys.argv) >= 2 and 'dateparser' in sys.modules:
    time = dateparser.parse(sys.argv[1])
    if isinstance(time, datetime.date):
        print(time)
    else:
        print('false')
else:
    print('Module dateparser not install or missing argv');
