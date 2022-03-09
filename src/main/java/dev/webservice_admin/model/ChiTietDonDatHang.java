package dev.webservice_admin.model;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietDonDatHang {

    private long maCTDDH;

    private Double donGia;

    private int soLuongDat;

    private MatHang matHang;

    private DonDatHang donDatHang;
}
