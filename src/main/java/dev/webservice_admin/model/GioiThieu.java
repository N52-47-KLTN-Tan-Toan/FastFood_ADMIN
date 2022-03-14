package dev.webservice_admin.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GioiThieu {

    private long maGT;

    private String tieuDe;

    private String noiDung;

    private String ten;

    private String hinhAnh;

}
