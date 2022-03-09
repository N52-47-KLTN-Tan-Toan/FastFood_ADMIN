package dev.webservice_admin.model;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

@Data
public abstract class User implements Serializable {

    private UUID userId;

    private String name;

    private String avatar;

    private String email;

    private String phone;

    private String address;

    private String createdBy;

    private String password;

    private String roleName;

    private Boolean gender;

    private LocalDate birthDate;

}
