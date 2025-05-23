<script setup>
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
              <div class="col-md-6">
                <h4 class="mb-0 text-white">Cuenta: 1.1.1.1 - Caja General</h4>
              </div>
              <div class="col-md-6 text-end">
                <span class="badge bg-light text-dark fs-6">
                  Saldo actual: $3,250.00
                </span>
              </div>
            </div>
          </div>
          <div class="card-body">
            <!-- Account Summary -->
            <div class="row mb-4">
              <div class="col-md-4">
                <div class="card bg-light">
                  <div class="card-body py-2">
                    <small class="text-muted">Saldo anterior</small>
                    <h5 class="mb-0">$2,000.00</h5>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card bg-light">
                  <div class="card-body py-2">
                    <small class="text-muted">Total débitos</small>
                    <h5 class="mb-0 text-success">$1,500.00</h5>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card bg-light">
                  <div class="card-body py-2">
                    <small class="text-muted">Total créditos</small>
                    <h5 class="mb-0 text-danger">$250.00</h5>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ledger Entries -->
            <table class="table table-bordered table-hover">
              <thead class="gradient-blue text-white">
                <tr>
                  <th class="text-center">Fecha</th>
                  <th class="text-center">Referencia</th>
                  <th class="text-center">Descripción</th>
                  <th class="text-center">Debe</th>
                  <th class="text-center">Haber</th>
                  <th class="text-center">Saldo</th>
                </tr>
              </thead>
              <tbody>
                <!-- Opening Balance -->
                <tr class="table-light">
                  <td class="text-center">01/06/2023</td>
                  <td class="text-center">-</td>
                  <td>Saldo inicial</td>
                  <td class="text-end"></td>
                  <td class="text-end"></td>
                  <td class="text-end fw-bold">$2,000.00</td>
                </tr>

                <!-- Transaction 1 -->
                <tr>
                  <td class="text-center">15/06/2023</td>
                  <td class="text-center">TXN-001</td>
                  <td>Venta a cliente XYZ</td>
                  <td class="text-end text-success">$1,500.00</td>
                  <td class="text-end"></td>
                  <td class="text-end fw-bold">$3,500.00</td>
                </tr>

                <!-- Transaction 2 -->
                <tr>
                  <td class="text-center">16/06/2023</td>
                  <td class="text-center">TXN-002</td>
                  <td>Pago a proveedor ABC</td>
                  <td class="text-end"></td>
                  <td class="text-end text-danger">$250.00</td>
                  <td class="text-end fw-bold">$3,250.00</td>
                </tr>
              </tbody>
            </table>

            <!-- Account Selector -->
            <div class="mt-4">
              <label class="form-label">Ver otra cuenta:</label>
              <select class="form-select">
                <option>1 - Activos</option>
                <option selected>1.1.1.1 - Caja General</option>
                <option>1.1.1.2 - Banco Principal</option>
                <option>1.1.2 - Cuentas por Cobrar</option>
                <option>2 - Pasivos</option>
                <option>3 - Patrimonio</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>