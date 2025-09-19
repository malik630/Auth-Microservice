const Joi = require("joi");

const validateLogin = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const validateRegister = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.pattern.base":
        "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre",
    }),
  role: Joi.string().valid("SUPER_ADMIN", "CLIENT").default("CLIENT"), // ← 2 rôles seulement
});

module.exports = {
  validateLogin,
  validateRegister,
};
