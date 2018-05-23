FROM node:9.11
ENV REPO='https://github.com/Sushipool/miner.git'
ENV HOME='/home/root'
ENV WALLET='NQ04 3F73 CHG5 RCBH CDMM MR5C RNJV 0N6J CXJR'
ENV SERVER='eu.sushipool.com'

RUN apt-get update && apt-get -y upgrade
RUN apt-get install -y python build-essential git

# RUN mkdir -p $HOME
WORKDIR $HOME

RUN git clone ${REPO}
RUN cd $HOME/miner && yarn
# CMD ["/bin/bash"]
CMD ["sh", "-c", "node miner/index.js --address=\"${WALLET}\" --server=${SERVER}"]
