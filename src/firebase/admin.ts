// src/firebase/admin.ts
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "lead-management-3c2d2",
      clientEmail:
        "firebase-adminsdk-fbsvc@lead-management-3c2d2.iam.gserviceaccount.com",
      privateKey:
        "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDZoDsVk2xNQeO3\nopoQrxvPKiv6AOuZH+D8DOavnsqCRd5FORaI/ssoiDUeVwklYW9R+JrtlVA8iBRL\nvyN3KAh44R/ijc1wdbvh/TCoi6Tr0Xp2kNr5fqRent41XzCP47EXPJ+l6t030m4w\nplhtDMa9r2nmh386QFSDSRMy+/q+9KaYrAusnYnSt+51HSfsuv0KKnZ04k5tXmTG\n0Vsg1um48B/V6TG7xCBOMxxlaU87e3KziThoDDoVO2bzazEUApIsxpXg4LTcIOIE\nmy+ujQkYkoxccYEtP8CxVjOKGIOfSA+9ci7wpbKSoshEEdEfVvF1jJ4pVRigOgFH\nIfMhDwLdAgMBAAECggEAA/h+M3vT3Un/OWXEWVsUjxBWKpLTOaFBBeBHYjtrtvpG\n3qz2uguqEcSAcZwFbPLs6Mo4K28Ovnf+JM6pOz6V/vyejA/pyGxBgBNSTLT1jp7t\nFNY6RJSYs6hC5iblOC7fl4yx3gFdxWu3ungCg4TY6HOXo07kFaBAWn/eE49Q6SR9\ne2kA2BnhIzBbjubl/NmsDArdVkR1rFilZBHNmGBIh3bwZ5VyEeJjWsNmzhPPcYAG\n585y0lpJYaC/0GMZCJWYULiODl7tm25hw6jfdyZMd516wYqeP9i0K5qHfC/QXqmG\nDLN2C9PKj+VbPcaoYDjae/hl9u1PdyB25FAe2OEhmQKBgQDvwExcgaihaxl/6ul3\n7WnHNQQxArIepocn7OE0UKMtmY2FTMBwWMbM7zJLaBDo1Nv3tuOl2pSrYes19nGE\nkLY2Ae5wMjrKd/KbmUvKN+cyh0Ma7UOMIMpMFB6HIVlHxWmNH/5/jX2yASQz/sqn\nFS/+oRuPBCIDFTAK/xdbHrs2iQKBgQDoYA60BBrN8ydzdj9FpcrxfdGtaasIzNIM\neVdcrCdWe6paMkUkp4+2kfSm7NXoIJ8Si76ls+1B94bneNidHOGoJ9/0q9CT+2Kh\n08+cRB6B2/x06KZf/rakjvAKdMd21qCJ8/8Be7Rc6KWszyyw/yF/of6kIw2kJDyJ\nhFvqD0jUtQKBgAqeswM5/xU/YD7JUhQs4Q2g7JGbM/alm8EJ/iPKGqBPd/RapP+U\n/yFeyxSKBI27uA6t/EGBgCpjSP737qlXm6qixUQVBYOocoev76qCdWxIj5FmxyIy\n5aMfFQcZVBIYzYchzq0pwFKdOFRRSfrCtoCJ9GWOYk9OpfUmvYscvmA5AoGAZjKw\n5L0VaNRy2lX8F86FxdW3HNRnU1R5YOEQ6gIQvvlef5KyVB+Zlgr1FWD95rxKGab6\nLvhF9Yg+fZjpc5fbKtB2r63M6vhZdaCpIynWXPh6PJSBb6CfhRoUOhUIEJzuOB3m\nXimgtmffTXRETIe4nOCLFHcSLcl+EmDy56rXNi0CgYEAtaKniSoKVeWzCDLn9ujZ\njoOeD0KBy8lziBsSa8M+bOBjCgxqcRGl7pLmzbM5l9we4MtcJhPKhK3cF32VOPRD\nLVN65bagGmLl5jNSihI7SbnytRx2d4S4fkAFWp894Vi0Yy7naJUObBVxBAmavykq\nXoG5W2TwchyElfTq/9ieFq0=\n-----END PRIVATE KEY-----\n".replace(
          /\\n/g,
          "\n"
        ),
    }),
  });
}

export default admin;
