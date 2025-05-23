<script setup lang="ts">
import NavBar from '../components/NavBar.vue';

</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>Balance General</h2>
          <div class="d-flex gap-2">
            <input type="date" class="form-control form-control-sm">
            <button class="btn btn-sm btn-primary">
              <i class="bi bi-search"></i> Generar
            </button>
            <button class="btn btn-sm btn-success">
              <i class="bi bi-file-earmark-excel"></i> Exportar
            </button>
          </div>
        </div>
        
        <div class="card overflow-card">
          <div class="card-header gradient-blue text-white">
            <h4 class="mb-0 text-white">Al 31 de Diciembre de 2023</h4>
          </div>
          <div class="card-body overflow-content p-0">
            
            <!-- Assets Section -->
            <div class="table-responsive">
              <table class="table table-bordered mb-0">
                <thead class="gradient-blue text-white">
                  <tr>
                    <th colspan="4" class="text-center">ACTIVOS</th>
                  </tr>
                  <tr>
                    <th width="15%">Código</th>
                    <th>Cuenta</th>
                    <th width="20%" class="text-end">Saldo Anterior</th>
                    <th width="20%" class="text-end">Saldo Actual</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Current Assets -->
                  <tr class="table-group-divider">
                    <td colspan="4" class="fw-bold bg-light">ACTIVOS CORRIENTES</td>
                  </tr>
                  <tr>
                    <td>1.1.1.1</td>
                    <td>Caja General</td>
                    <td class="text-end">$2,000.00</td>
                    <td class="text-end fw-bold">$3,250.00</td>
                  </tr>
                  <tr>
                    <td>1.1.1.2</td>
                    <td>Banco Principal</td>
                    <td class="text-end">$5,000.00</td>
                    <td class="text-end fw-bold">$7,800.00</td>
                  </tr>
                  <tr>
                    <td>1.1.2</td>
                    <td>Cuentas por Cobrar</td>
                    <td class="text-end">$3,500.00</td>
                    <td class="text-end fw-bold">$4,200.00</td>
                  </tr>
                  <tr class="table-secondary">
                    <td colspan="2" class="fw-bold text-end">Total Activos Corrientes</td>
                    <td class="text-end fw-bold">$10,500.00</td>
                    <td class="text-end fw-bold">$15,250.00</td>
                  </tr>
                  
                  <!-- Fixed Assets -->
                  <tr class="table-group-divider">
                    <td colspan="4" class="fw-bold bg-light">ACTIVOS NO CORRIENTES</td>
                  </tr>
                  <tr>
                    <td>1.2.1</td>
                    <td>Equipo de Oficina</td>
                    <td class="text-end">$8,000.00</td>
                    <td class="text-end fw-bold">$7,200.00</td>
                  </tr>
                  <tr>
                    <td>1.2.2</td>
                    <td>Depreciación Acumulada</td>
                    <td class="text-end">($2,000.00)</td>
                    <td class="text-end fw-bold">($2,800.00)</td>
                  </tr>
                  <tr class="table-secondary">
                    <td colspan="2" class="fw-bold text-end">Total Activos No Corrientes</td>
                    <td class="text-end fw-bold">$6,000.00</td>
                    <td class="text-end fw-bold">$4,400.00</td>
                  </tr>
                  
                  <!-- Total Assets -->
                  <tr class="table-group-divider">
                    <td colspan="2" class="fw-bold text-end">TOTAL ACTIVOS</td>
                    <td class="text-end fw-bold">$16,500.00</td>
                    <td class="text-end fw-bold">$19,650.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Liabilities and Equity Section -->
            <div class="table-responsive">
              <table class="table table-bordered mb-0">
                <thead class="gradient-blue text-white">
                  <tr>
                    <th colspan="4" class="text-center">PASIVOS Y PATRIMONIO</th>
                  </tr>
                  <tr>
                    <th width="15%">Código</th>
                    <th>Cuenta</th>
                    <th width="20%" class="text-end">Saldo Anterior</th>
                    <th width="20%" class="text-end">Saldo Actual</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Current Liabilities -->
                  <tr class="table-group-divider">
                    <td colspan="4" class="fw-bold bg-light">PASIVOS CORRIENTES</td>
                  </tr>
                  <tr>
                    <td>2.1.1</td>
                    <td>Cuentas por Pagar</td>
                    <td class="text-end">$3,200.00</td>
                    <td class="text-end fw-bold">$2,800.00</td>
                  </tr>
                  <tr>
                    <td>2.1.2</td>
                    <td>Préstamos a Corto Plazo</td>
                    <td class="text-end">$5,000.00</td>
                    <td class="text-end fw-bold">$6,000.00</td>
                  </tr>
                  <tr class="table-secondary">
                    <td colspan="2" class="fw-bold text-end">Total Pasivos Corrientes</td>
                    <td class="text-end fw-bold">$8,200.00</td>
                    <td class="text-end fw-bold">$8,800.00</td>
                  </tr>
                  
                  <!-- Long-term Liabilities -->
                  <tr class="table-group-divider">
                    <td colspan="4" class="fw-bold bg-light">PASIVOS NO CORRIENTES</td>
                  </tr>
                  <tr>
                    <td>2.2.1</td>
                    <td>Préstamos a Largo Plazo</td>
                    <td class="text-end">$4,000.00</td>
                    <td class="text-end fw-bold">$3,500.00</td>
                  </tr>
                  <tr class="table-secondary">
                    <td colspan="2" class="fw-bold text-end">Total Pasivos No Corrientes</td>
                    <td class="text-end fw-bold">$4,000.00</td>
                    <td class="text-end fw-bold">$3,500.00</td>
                  </tr>
                  
                  <!-- Equity -->
                  <tr class="table-group-divider">
                    <td colspan="4" class="fw-bold bg-light">PATRIMONIO</td>
                  </tr>
                  <tr>
                    <td>3.1</td>
                    <td>Capital Social</td>
                    <td class="text-end">$10,000.00</td>
                    <td class="text-end fw-bold">$10,000.00</td>
                  </tr>
                  <tr>
                    <td>3.2</td>
                    <td>Utilidades Retenidas</td>
                    <td class="text-end">($5,700.00)</td>
                    <td class="text-end fw-bold">($2,650.00)</td>
                  </tr>
                  <tr class="table-secondary">
                    <td colspan="2" class="fw-bold text-end">Total Patrimonio</td>
                    <td class="text-end fw-bold">$4,300.00</td>
                    <td class="text-end fw-bold">$7,350.00</td>
                  </tr>
                  
                  <!-- Total Liabilities and Equity -->
                  <tr class="table-group-divider">
                    <td colspan="2" class="fw-bold text-end">TOTAL PASIVOS Y PATRIMONIO</td>
                    <td class="text-end fw-bold">$16,500.00</td>
                    <td class="text-end fw-bold">$19,650.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
    .overflow-card {
        height: 85vh;
        display: flex;
        flex-direction: column;
    }

    .overflow-content {
        overflow-y: auto;
        flex: 1; 
        min-height: 0;
    }
</style>