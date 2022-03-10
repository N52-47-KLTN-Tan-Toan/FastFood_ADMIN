package dev.webservice_admin.service;

import dev.webservice_admin.model.CustomUserDetails;
import dev.webservice_admin.model.NhanVien;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${app.url.employee}")
    private String url;

    @Override
    public UserDetails loadUserByUsername(String s) throws UsernameNotFoundException {

        NhanVien nhanVien = restTemplate.getForObject(url + "/username=" + s, NhanVien.class);

        if (nhanVien == null) {
            throw new UsernameNotFoundException("Nhân viên " + nhanVien + " không tìm thấy trong cơ sở dữ liệu");
        }

        String role = restTemplate.getForObject(url + "/roleName/username=" + s, String.class);

        List<GrantedAuthority> grantList = new ArrayList<GrantedAuthority>();

        if (role != null) {
            GrantedAuthority authority = new SimpleGrantedAuthority(role);
            grantList.add(authority);
        }

        UserDetails userDetails = new User(String.valueOf(nhanVien.getUsername()), nhanVien.getPassword(), grantList);

        return new CustomUserDetails(nhanVien);
    }
}
