FROM elasticsearch:6.5.3

MAINTAINER microvnhaxor

#COPY elasticsearch-analysis-vietnamese-6.5.3.zip /usr/share/elasticsearch/

#RUN cd /usr/share/elasticsearch && \
#    bin/elasticsearch-plugin install file:///usr/share/elasticsearch/elasticsearch-analysis-vietnamese-6.5.3.zip --batch  && \
RUN    bin/elasticsearch-plugin install analysis-icu --batch
