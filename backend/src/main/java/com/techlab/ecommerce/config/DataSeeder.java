package com.techlab.ecommerce.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.techlab.ecommerce.categorias.Categoria;
import com.techlab.ecommerce.categorias.CategoriaRepository;
import com.techlab.ecommerce.productos.Producto;
import com.techlab.ecommerce.productos.ProductoRepository;
import com.techlab.ecommerce.usuarios.UsuarioService;

@Component
public class DataSeeder implements CommandLineRunner {
    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioService usuarioService;

    public DataSeeder(CategoriaRepository categoriaRepository, ProductoRepository productoRepository,
            UsuarioService usuarioService) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
        this.usuarioService = usuarioService;
    }

    @Override
    public void run(String... args) {
        usuarioService.crearAdminInicial("Administrador", "admin@techlab.com", "admin1234");

        if (productoRepository.count() > 0) {
            return;
        }

        Categoria cafe = categoriaRepository.save(new Categoria("Cafe", "Cafes seleccionados de origen."));
        Categoria te = categoriaRepository.save(new Categoria("Te", "Tes e infusiones premium."));
        Categoria accesorios = categoriaRepository.save(new Categoria("Accesorios", "Productos para preparar y servir."));

        productoRepository.save(new Producto(
                "Cafe Premium Molido",
                "Cafe intenso de origen colombiano, ideal para filtro.",
                5200.0,
                "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
                25,
                cafe));
        productoRepository.save(new Producto(
                "Te Verde Organico",
                "Te verde suave con notas herbales y aroma fresco.",
                3800.0,
                "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80",
                30,
                te));
        productoRepository.save(new Producto(
                "Prensa Francesa",
                "Prensa de vidrio para preparar cafe de cuerpo completo.",
                14500.0,
                "https://images.unsplash.com/photo-1522992319-0365e5f11656?auto=format&fit=crop&w=600&q=80",
                10,
                accesorios));
    }
}
