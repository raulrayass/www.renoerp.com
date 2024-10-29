<?php
require_once '../../models/navigation/BreadcrumbModel.php'; // Ruta al modelo de breadcrumb

class BreadcrumbController {
    private $model;

    public function __construct() {
        $this->model = new BreadcrumbModel();
    }

    // Método para agregar un elemento al breadcrumb
    public function addBreadcrumbItem($label, $url) {
        $this->model->addBreadcrumbItem($label, $url);
    }

    // Método para obtener los elementos del breadcrumb
    public function getBreadcrumb() {
        return $this->model->getBreadcrumbItems(); // Obtiene los elementos del breadcrumb
    }
}
