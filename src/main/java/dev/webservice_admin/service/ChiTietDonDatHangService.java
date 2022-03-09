package dev.webservice_admin.service;

import dev.webservice_admin.model.ChiTietDonDatHang;

import java.util.List;

public interface ChiTietDonDatHangService {

    List<ChiTietDonDatHang> findAllByDonDatHang(Long id);

}
