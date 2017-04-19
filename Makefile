#
#   Copyright (c) 2016-2017 Philipp Paulweber
#   All rights reserved.
#
#   Developed by: Philipp Paulweber
#                 https://github.com/ppaulweber/gilapv
#
#   This file is part of gilapv.
#
#   gilapv is free software: you can redistribute it and/or modify
#   it under the terms of the GNU General Public License as published by
#   the Free Software Foundation, either version 3 of the License, or
#   (at your option) any later version.
#
#   gilapv is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
#   GNU General Public License for more details.
#
#   You should have received a copy of the GNU General Public License
#   along with gilapv. If not, see <http://www.gnu.org/licenses/>.
#

ifndef FROM
FROM = master
endif

ifndef TO
TO = master
endif

DIR=ppaulweber/gilapv
DEV=https://raw.githubusercontent.com/$(DIR)
CDN=https://cdn.rawgit.com/$(DIR)

default: help

help:
	@echo "TODO"

links:
	echo "$(FROM) --> $(TO)"
	(for i in `grep -r README.org ./src/* -e $(FROM) -l`; do \
		echo $$i; \
		sed -i "s/$(FROM)/$(TO)/g" $$i; \
	done)
	(for i in `grep -r README.org ./src/* -e gilapv/branches/$(FROM) -l`; do \
		echo $$i; \
		sed -i "s/gilapv\/branches\/$(FROM)/gilapv\/branches\/$(TO)/g" $$i; \
	done)

release:
	$(MAKE) FROM=$(DEV)/master TO=$(CDN)/`git branch | grep -e "* " | sed "s/* //g"` links
