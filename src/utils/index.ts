import jwt from "jsonwebtoken";
import crypto from "node:crypto";
const pickKeysInObject = <T extends object, K extends keyof T>({
  object,
  keys,
}: {
  object: T;
  keys: K[];
}) =>
  keys.reduce((result, key) => {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      result[key] = object[key];
    }
    return result;
  }, {} as Pick<T, K>);

const generateKey = () => crypto.randomBytes(64).toString("hex");

const convertArrayToObject = (array: Array<any>) => {
  return array.reduce((obj, item) => ({ ...obj, [`${item}`]: 1 }), {});
};

interface NestedObject {
  [key: string]: any;
}
const updateNestedObjectParse = (object: NestedObject): NestedObject => {
  if (object === null || typeof object !== "object") {
    return object;
  }
  const updatedObject: NestedObject = {};
  Object.entries(object).forEach(([key, value]) => {
    if (value !== null) {
      if (typeof value === "object" && !Array.isArray(value)) {
        const nestedUpdates = updateNestedObjectParse(value);
        for (const nestedKey in nestedUpdates) {
          updatedObject[`${key}.${nestedKey}`] = nestedUpdates[nestedKey];
        }
      } else {
        updatedObject[key] = value;
      }
    }
  });
  return updatedObject;
};

const generateTokens = ({
  id,
  type,
}: {
  id: string;
  type: string;
}): {
  accessToken: string;
  refreshToken: string;
} => {
  // gen access token
  const accessKey = process.env.ACCESS_TOKEN_KEY as string;
  const accessToken = jwt.sign(
    {
      userId: id,
      userPosition: type,
    },
    accessKey,
    {
      expiresIn: `${2}h`,
    }
  );

  // gen refresh token
  const refreshKey = process.env.REFRESH_TOKEN_KEY as string;
  const refreshToken = jwt.sign(
    {
      userId: id,
      userPosition: type,
    },
    refreshKey,
    {
      expiresIn: `${21}d`,
    }
  );

  return { accessToken, refreshToken };
};

export { pickKeysInObject, generateKey, convertArrayToObject, generateTokens };
