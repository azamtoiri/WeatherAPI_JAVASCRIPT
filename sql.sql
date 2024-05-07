-- С оконной функцией
SELECT sub.user_id, sub.topic_id COUNT() AS score
FROM (
    SELECT views.user_id, views.art_id, views.time, topics.topic_id,
           ROW_NUMBER() OVER (PARTITION BY v.user_id ORDER BY v.time) AS row_num
    FROM views
    JOIN topics ON views.art_id = topics.art_id
) AS sub
WHERE sub.row_num <= 50
GROUP BY sub.user_id, sub.topic_id;

