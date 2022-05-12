FROM ubuntu:20.04

ARG DEBIAN_FRONTEND=noninteractive
ARG HOST_UID=1000
ARG HOST_GID=1000

RUN apt-get update
RUN apt-get install -y curl gettext-base nginx

RUN groupadd -g $HOST_GID admin
RUN adduser --disabled-password --gecos '' -u $HOST_UID -gid $HOST_GID admin

COPY ./admin /home/admin/src
COPY ./ssl /home/admin/ssl
COPY ./etc/nginx.conf /etc/nginx/nginx.template.conf
COPY ./etc/entrypoint.sh /root/entrypoint.sh

WORKDIR /root
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash
RUN apt-get install -y nodejs
RUN apt-get -y install git
RUN npm install -g @angular/cli@12.2.0

WORKDIR /etc/nginx
RUN rm -rf sites-available sites-enabled nginx.conf

RUN chown -R admin:admin /home/admin/

USER admin
WORKDIR /home/admin/src
RUN npm install
RUN ng build --prod
RUN cp -r dist/admin ../admin

USER root
WORKDIR /root
RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]