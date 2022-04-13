package dev.webservice_admin.service;

import dev.webservice_admin.model.KhachHang;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class KhachHangServiceImpl implements KhachHangService{

    @Value("${app.url.customer}")
    private String url;

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public KhachHang findById(String s) {
        KhachHang object = restTemplate.getForObject(url + "/" + s, KhachHang.class);
        return object;
    }

}
