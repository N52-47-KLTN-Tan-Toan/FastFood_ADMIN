package dev.webservice_admin.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonDatHang {

    private long maDDH;

    private LocalDate ngayDatHang;

    private String trangThai;

    private String diaChiGiaoHang;

    private String hinhThuc;

    private Double tongTien;

    private KhachHang khachHang;

}
