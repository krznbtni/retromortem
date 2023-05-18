FROM alpine:latest

ARG PB_VERSION=0.15.3

RUN apk add --no-cache \
  unzip \
  ca-certificates

ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

COPY ./db/pb_data /pb/pb_data
COPY ./db/pb_migrations /pb/pb_migrations

run ls -laF /pb/

# start PocketBase
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090"]
