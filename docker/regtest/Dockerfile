ARG UBUNTU_VERSION

ARG BITCOIN_VERSION
ARG ELEMENTS_VERSION

ARG LND_VERSION
ARG C_LIGHTNING_VERSION

FROM boltz/bitcoin-core:${BITCOIN_VERSION} AS bitcoin-core
FROM boltz/elements:${ELEMENTS_VERSION} AS elements-core

FROM boltz/lnd:${LND_VERSION} AS lnd
FROM boltz/c-lightning:${C_LIGHTNING_VERSION} AS cln

FROM ubuntu:${UBUNTU_VERSION}

# Install dependencies
RUN apt-get update && \
  apt-get -y upgrade && \
  apt-get -y install \
  jq \
  curl \
  psmisc \
  openssl \
  libtool \
  autoconf \
  libpq-dev \
  libdb-dev \
  pkg-config \
  libdb++-dev \
  libzmq3-dev \
  libevent-dev \
  libevent-dev \
  libsqlite3-dev \
  libboost-chrono-dev \
  libboost-system-dev \
  libboost-thread-dev \
  libboost-filesystem-dev \
  libboost-program-options-dev && \
  rm -rf /var/lib/apt/lists/*

# Copy node executables
COPY --from=bitcoin-core /bin/bitcoind /bin/
COPY --from=bitcoin-core /bin/bitcoin-cli /bin/

COPY --from=elements-core /bin/elementsd /bin/
COPY --from=elements-core /bin/elements-cli /bin/

# Copy the LND executables
COPY --from=lnd /bin/lnd /bin/
COPY --from=lnd /bin/lncli /bin/

# Copy the Core Lightning executables
COPY --from=cln /bin/lightningd /bin/
COPY --from=cln /bin/lightning-cli /bin/
COPY --from=cln /usr/libexec /usr/libexec

# Copy configuration files
COPY regtest/data/core/config.conf /root/.bitcoin/bitcoin.conf
COPY regtest/data/elements/elements.conf /root/.elements/elements.conf

COPY regtest/data/lnd/lnd.conf /root/.lnd-btc/
COPY regtest/data/lnd/lnd.conf /root/.lnd-btc2/

COPY regtest/data/cln/config /root/.lightning/config

# Copy certificates for the LNDs
COPY regtest/data/lnd/certificates /root/.lnd-btc/
COPY regtest/data/lnd/certificates /root/.lnd-btc2/

# Copy macaroons for the LNDs
COPY regtest/data/lnd/macaroons /root/.lnd-btc/data/chain/bitcoin/regtest/
COPY regtest/data/lnd/macaroons /root/.lnd-btc2/data/chain/bitcoin/regtest/

# Copy start scripts
COPY regtest/scripts /bin/

# Configure the daemons
RUN bash configure.sh

# Run the setup script
RUN bash setup.sh

# Expose RPC ports of the nodes
EXPOSE 18443 19443 18884

# Expose ZMQ ports of the nodes
EXPOSE 29000 29001 29002 30000 30001 30002 31000 31001 31002

EXPOSE 9735

# Expose gRPC ports of the LNDs
EXPOSE 10009 10011 11009 11010

# Expose REST API ports of the LNDs
EXPOSE 8080 8081

ENTRYPOINT ["entrypoint.sh"]
