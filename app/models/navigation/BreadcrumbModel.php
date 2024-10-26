<?php
class BreadcrumbModel {
    private $items = [];

    public function addBreadcrumbItem($label, $url) {
        $this->items[] = ['label' => $label, 'url' => $url];
    }

    public function getBreadcrumbItems() {
        return $this->items;
    }
}
