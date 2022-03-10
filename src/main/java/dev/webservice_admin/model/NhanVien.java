package dev.webservice_admin.model;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@NoArgsConstructor
public class NhanVien extends User{

    private String username;

}
