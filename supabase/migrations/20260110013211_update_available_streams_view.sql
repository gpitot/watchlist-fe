DROP VIEW "public"."available_streams";
CREATE OR REPLACE VIEW "public"."available_streams" WITH ("security_invoker"='on') AS
 SELECT 
    "user_profiles"."id" AS "user_id",
    "user_profiles"."email",
    "movies"."title",
    "movie_providers"."provider_name",
    "movie_providers"."provider_type",
    "movie_providers"."created_at"
   FROM ((("user_profiles"
     LEFT JOIN "public"."movies_users" ON (("user_profiles"."id" = "movies_users"."user_id")))
     LEFT JOIN "public"."movies" ON (("movies"."id" = "movies_users"."movie_id")))
     LEFT JOIN "public"."movie_providers" ON (("movie_providers"."movie_id" = "movies"."id")))
  WHERE (("movie_providers"."provider_name")::"text" IN ( SELECT "user_providers"."provider_name"
           FROM "public"."user_providers"
          WHERE ("user_providers"."id" = "user_profiles"."id")));