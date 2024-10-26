class UserController extends Controller {
    public function index() {
        // Definir las variables para el breadcrumb
        $data['seccion'] = "Gestión de Usuarios";
        $data['pagina_actual'] = "Lista de Usuarios";
        
        // Cargar la vista y pasar las variables
        $this->load->view('layout', $data); // Cargar el layout principal
    }
}
