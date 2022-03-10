package dev.webservice_admin.service;

import dev.webservice_admin.model.NhanVien;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class NhanVienServiceImpl implements NhanVienService{

    @Value("${app.url.employee}")
    private String url;

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public NhanVien findByUsername(String s) {
        NhanVien nhanVien = restTemplate.getForObject(url + "/username=" + s, NhanVien.class);
        return nhanVien;
    }
}
