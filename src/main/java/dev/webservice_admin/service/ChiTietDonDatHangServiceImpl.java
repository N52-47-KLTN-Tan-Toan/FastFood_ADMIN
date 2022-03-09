package dev.webservice_admin.service;

import dev.webservice_admin.model.ChiTietDonDatHang;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class ChiTietDonDatHangServiceImpl implements ChiTietDonDatHangService{

    @Value("${app.url.orderDetail}")
    private String url;

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public List<ChiTietDonDatHang> findAllByDonDatHang(Long id) {
        ResponseEntity<List<ChiTietDonDatHang>> responseEntity
                = restTemplate.exchange(url + "/donDatHang=" + id, HttpMethod.GET, null,
                new ParameterizedTypeReference<List<ChiTietDonDatHang>>() {
                });
        List<ChiTietDonDatHang> list = responseEntity.getBody();
        return list;
    }
}
