package dev.webservice_admin.controller;

import dev.webservice_admin.model.NhanVien;
import dev.webservice_admin.service.NhanVienService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.security.Principal;

@Controller
@RequestMapping("/type-product")
public class ProductTypeController {

    @Autowired
    private NhanVienService nhanVienService;

    @GetMapping
    public String categoriesPage (Model model, Principal principal) {

        User loginedUser = (User) ((Authentication) principal).getPrincipal();
        NhanVien nhanVien = nhanVienService.findByUsername(loginedUser.getUsername());
        model.addAttribute("nhanVien", nhanVien);

        return "type-product";
    }

}
