FROM postgres:latest

# Install required packages
RUN apt-get update && apt-get install -y \
    git \
    make \
    postgresql-server-dev-15 \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Clone and install pgjwt
RUN git clone https://github.com/michelp/pgjwt.git /tmp/pgjwt \
    && cd /tmp/pgjwt \
    && make install \
    && rm -rf /tmp/pgjwt
