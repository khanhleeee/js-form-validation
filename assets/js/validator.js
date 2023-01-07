// Variables
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

/* Đối tượng Validator (contructor function) */
const Validator = (options) => {
   // Lấy ra cha của input tương ứng
   const getParent = (element, selector) => {
      var parent = element.closest(selector);
      return parent;
   }
   var formElement = $(options.form);
   var selectorRules = {};
   // Function xử lý validate
   const validate = (inputElement, rule) => {
      const rules = selectorRules[rule.selector];
      const inputGroupElement = getParent(inputElement, options.formGroup);
      const inputMessage = inputGroupElement.querySelector(options.errorMessage);
      var errorMessage;

      // Lặp qua các rules của selector
      for(var i in rules) {
         switch (inputElement.type) {
            case 'radio':
            case 'checkbox':
               errorMessage = rules[i](
                  formElement.querySelector(rule.selector + ':checked')
               );
               break;
            default:
               errorMessage = rules[i](inputElement.value);
         }
         if(errorMessage) break;
      }
      if(errorMessage) {
         inputGroupElement.classList.add('invalid');
         inputMessage.innerText = errorMessage;
      } else {
         inputGroupElement.classList.remove('invalid');
         inputMessage.innerText = '';
      }

      // Convert errorMessage sang boolean [true nếu có lỗi, false nếu không có lỗi]
      return !!errorMessage;
   }

   // Lấy element của form cần validate
   if(formElement) {
      // Khi submit form
      formElement.onsubmit = (e) => {
         e.preventDefault();
         var isFormValid = true;
         // Thực hiện validate
         options.rules.forEach((rule) => {
            var inputElement = formElement.querySelector(rule.selector);
            isInValid = validate(inputElement, rule);
            if(isInValid) {
               isFormValid = false;
            }
         })
         if(isFormValid) {
            if(typeof options.onSubmit === 'function') {
               var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
               var formValues = Array.from(enableInputs).reduce((values, currentInput) => {
                  switch (currentInput.type) {
                     case 'radio':
                        if(currentInput.matches(':checked')) {
                           values[currentInput.name] = currentInput.value
                        }
                        break;
                     case 'checkbox':
                        if(!currentInput.matches(':checked')) {
                           values[currentInput.name] = '';
                           return values;
                        }
                        if(!Array.isArray(values[currentInput.name])) {
                           values[currentInput.name] = [];
                        }
                        values[currentInput.name].push(currentInput.value);
                        break;
                     case 'file':
                        values[currentInput.name] = currentInput.files;
                        break;
                        default:
                        values[currentInput.name] = currentInput.value;
                  }
                  return values;
               }, {})
               options.onSubmit(formValues);
            } else {
               formElement.submit();
            }
         }
      }

      // Lặp qua các rule và xử lý sự kiện
      options.rules.forEach((rule) => {
         var inputElements = formElement.querySelectorAll(rule.selector);
         if(Array.isArray(selectorRules[rule.selector])) {
            selectorRules[rule.selector].push(rule.test)
         } else {
            selectorRules[rule.selector] = [rule.test]
         }


         Array.from(inputElements).forEach((inputElement) => {
            // Xử lý khi blur khỏi input
            inputElement.onblur = () => {
               validate(inputElement, rule);
            }
            // Xử lý khi người dùng nhập input
            inputElement.oninput = () => {
               const inputGroupElement = getParent(inputElement, options.formGroup);
               const inputMessage = inputGroupElement.querySelector(options.errorMessage);
               inputGroupElement.classList.remove('invalid');
               inputMessage.innerText = '';
            }
            // Xử lý khi change input
            inputElement.onclick = () => {
               console.log(123);
            }
         })
      })
   }
}

/* Định nghĩa rules */
// Kiểm tra bắt buộc nhập
Validator.isRequired = (selector, message) => {
   return {
      selector,
      test: (value) => {
         return value ? undefined : message ||'Please fill the blank'
      }
   }
}

// Kiểm tra định dạng email
Validator.isEmail = (selector, message) => {
   return {
      selector,
      test: (value) => {
         var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
         return regex.test(value) ? undefined : message ||'Invalid email address. Valid e-mail can contain only latin letters, numbers, \'@ \' and .'
      }
   }
}

// Kiểm tra định dạng password
Validator.minLength = (selector, minLength, message) => {
   return {
      selector,
      test: (value) => {
         return value.length >= minLength ? undefined : message ||`Password need at least ${minLength} characters`
      }
   }
}

// Kiểm tra nhập lại password
Validator.isConfirmed = (selector, getPasswordValue, message) => {
   return {
      selector,
      test: (value) => {
         return value === getPasswordValue() ? undefined : message || 'The value does not match';
      }
   }
}