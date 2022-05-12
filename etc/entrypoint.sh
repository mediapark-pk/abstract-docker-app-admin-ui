#!/bin/bash
cd /root
export ESC='$'
envsubst < /etc/nginx/nginx.template.conf > /etc/nginx/nginx.conf
/usr/sbin/nginx -g 'daemon off;
