package dev.webservice_admin.controller;

import dev.webservice_admin.service.NhanVienService;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.security.Principal;

@Controller
@RequestMapping("/type-product")
public class ProductTypeController {

    @GetMapping
    public String categoriesPage () {
        return "type-product";
    }

}
