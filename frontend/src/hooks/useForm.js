//voy a devolver un objeto
//porque si tengo que añadir o modificar
//algo es más fácil devolverlo como objeto

import { useState } from "react";

//Le paso un objeto vacío llamado initialForm
export const useForm = (initialForm={}) => {
    const[formState, setFormState] = useState(initialForm)
  
    const onInputChange = ({ target }) =>{
        const {name,value}=target;
        setFormState({
            ...formState,
            [ name ]: value
          
        });
    }

    //no le paso nada como argumento para que se pongan los mismos datos que cuando se carga por primera vez el formulario con los 
    //placeholder
    const onResetForm= () =>{
        setFormState(initialForm)
    }

    const onSubmitForm = (callback) => {
        callback(formState);
    }
  return {
    ...formState, //desestructuro los campos que le paso a través del initialForm
    formState,
    onInputChange,
    onResetForm,
    onSubmitForm
  }
}
