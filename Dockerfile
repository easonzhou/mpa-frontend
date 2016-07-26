FROM tomcat:8.0.36-jre8
MAINTAINER Zhou Yinsheng <yinsheng@sg.ibm.com>
ADD /target/SAFER.war /usr/local/tomcat/webapps/SAFER.war
ADD /target/SAFER_REST.war /usr/local/tomcat/webapps/SAFER_REST.war
CMD ["catalina.sh", "run"]
