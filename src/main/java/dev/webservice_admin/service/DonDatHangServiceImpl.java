package dev.webservice_admin.service;

import dev.webservice_admin.model.DonDatHang;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class DonDatHangServiceImpl implements DonDatHangService{

    @Value("${app.url.order}")
    private String url;

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public DonDatHang findById(Long id) {
        DonDatHang obj = restTemplate.getForObject(url + "/" + id, DonDatHang.class);
        return obj;
    }
}
