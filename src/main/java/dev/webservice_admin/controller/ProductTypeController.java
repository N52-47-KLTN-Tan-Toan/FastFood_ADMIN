package dev.webservice_admin.controller;

import org.springframework.stereotype.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/type-product")
public class ProductTypeController {

    @GetMapping
    public String categoriesPage () {
        return "type-product";
    }

}
