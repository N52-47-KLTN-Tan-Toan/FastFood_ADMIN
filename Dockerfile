FROM openjdk:11
WORKDIR /webservice_admin
COPY ./target/WebService_Admin-0.0.1-SNAPSHOT.war /webservice_admin
COPY . /webservice_admin
EXPOSE 8001
CMD ["java","-jar","WebService_Admin-0.0.1-SNAPSHOT.war"]