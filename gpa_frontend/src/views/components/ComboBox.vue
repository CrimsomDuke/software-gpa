
<script setup>
import { onMounted, ref } from 'vue';


const props = defineProps({
    dataSource : {
        type: Array,
        required: true,
    },
    valueField : {
        type: String,
        required: true,
    },
    textField : {
        type: String,
        required: true,
    },
    defaultValue : {
        type: String,
        required: true,
    },
    isPrimitiveArray : {
        type: Boolean,
        default: false,
    },
    disabled : {
        type: Boolean,
        default: false,
    }
})
//Con emit se emiten eventos al padre
const emit = defineEmits(['update:modelValue']);
const selectedValue = ref(null);

onMounted(() => {
    selectedValue.value = props.defaultValue;
    emit('update:modelValue', selectedValue.value);
    console.log('Selected value:', selectedValue.value);
});

const onValueSelected = (e) => {
    selectedValue.value = e.target.value;
    // Dar el valor de selectedValue al padre
    emit('update:modelValue', selectedValue.value);
    console.log('Selected value:', selectedValue.value);
}

</script>

<template>
    <div>
        <select @change="onValueSelected" v-if="isPrimitiveArray === false" class="form-control form-select"
            :disabled="disabled">
            <option v-for="item in dataSource" :key="item[valueField]" :value="item[valueField]"
                :selected="item[valueField] === defaultValue">
                {{ item[textField] }}
            </option>
        </select>
        <select @change="onValueSelected" v-else class="form-control form-select"
            :disabled="disabled">
            <option v-show="defaultValue" value="" disabled selected>--Seleccione una opción--</option>
            <option v-for="item in dataSource" :key="item" :value="item"
                :selected="item === defaultValue">
                {{ item }}
            </option>
        </select>
    </div>
</template>