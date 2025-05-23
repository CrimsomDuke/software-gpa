<script setup lang="ts">
import NavBar from '../components/NavBar.vue';

</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <div>
        <h2>Libro Mayor</h2>
        <div class="card">
          <div class="card-header gradient-blue text-white">
            <div class="row align-items-center">
              <div class="col-md-4">
                <h4 class="mb-0 text-white">Transacciones Contables</h4>
              </div>
              <div class="col-md-8">
                <div class="row g-2">
                  <div class="col-md-4">
                    <select class="form-select form-select-sm">
                      <option>Todas las cuentas</option>
                      <option>Activos (1)</option>
                      <option>Pasivos (2)</option>
                      <option>Patrimonio (3)</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <input type="date" class="form-control form-control-sm">
                  </div>
                  <div class="col-md-4">
                    <input type="date" class="form-control form-control-sm">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="card-body">
            <table class="table table-bordered table-hover">
              <thead class="gradient-blue text-white">
                <tr>
                  <th class="text-center">Fecha</th>
                  <th class="text-center">Referencia</th>
                  <th class="text-center">Descripción</th>
                  <th class="text-center">Cuenta</th>
                  <th class="text-center">Débito</th>
                  <th class="text-center">Crédito</th>
                  <th class="text-center">Saldo</th>
                </tr>
              </thead>
              <tbody>
                <!-- Sample transaction group -->
                <tr class="table-primary">
                  <td colspan="7" class="fw-bold">Transacción #TXN-001</td>
                </tr>
                <tr>
                  <td class="text-center">15/06/2023</td>
                  <td class="text-center">TXN-001</td>
                  <td>Venta a cliente XYZ</td>
                  <td>1.1.1.1 Caja General</td>
                  <td class="text-end">$1,500.00</td>
                  <td class="text-end">$0.00</td>
                  <td class="text-end fw-bold">$1,500.00</td>
                </tr>
                <tr>
                  <td class="text-center">15/06/2023</td>
                  <td class="text-center">TXN-001</td>
                  <td>Venta a cliente XYZ</td>
                  <td>4.1 Ventas</td>
                  <td class="text-end">$0.00</td>
                  <td class="text-end">$1,500.00</td>
                  <td class="text-end fw-bold">$0.00</td>
                </tr>

                <!-- Another sample transaction group -->
                <tr class="table-primary">
                  <td colspan="7" class="fw-bold">Transacción #TXN-002</td>
                </tr>
                <tr>
                  <td class="text-center">16/06/2023</td>
                  <td class="text-center">TXN-002</td>
                  <td>Compra de materiales</td>
                  <td>5.1 Gastos de Materiales</td>
                  <td class="text-end">$750.00</td>
                  <td class="text-end">$0.00</td>
                  <td class="text-end fw-bold">$750.00</td>
                </tr>
                <tr>
                  <td class="text-center">16/06/2023</td>
                  <td class="text-center">TXN-002</td>
                  <td>Compra de materiales</td>
                  <td>1.1.1.1 Caja General</td>
                  <td class="text-end">$0.00</td>
                  <td class="text-end">$750.00</td>
                  <td class="text-end fw-bold">$750.00</td>
                </tr>
              </tbody>
              <tfoot class="gradient-blue text-white">
                <tr>
                  <th colspan="4" class="text-end">Totales:</th>
                  <th class="text-end">$2,250.00</th>
                  <th class="text-end">$2,250.00</th>
                  <th class="text-end">$2,250.00</th>
                </tr>
              </tfoot>
            </table>

            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-secondary">
                  <i class="bi bi-arrow-left"></i> Anterior
                </button>
                <button class="btn btn-sm btn-outline-secondary">
                  Siguiente <i class="bi bi-arrow-right"></i>
                </button>
              </div>
              <span class="text-muted">Mostrando 1-4 de 4 transacciones</span>
              <select class="form-select form-select-sm w-auto">
                <option>10 por página</option>
                <option>25 por página</option>
                <option>50 por página</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>