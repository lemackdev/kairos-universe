# Adding Organizations

## Required workflow

1. Verify the organization does not already exist under another ID, slug,
   historical name, or alias.
2. Register supporting sources before creating the organization.
3. Create the canonical record under `data/organizations/`.
4. Use `fictional` or `real-world-reference` as the origin classification.
5. Keep unknown dates, country, website, social links, and assets unknown.
6. Add the path to `index/organizations.json` in alphabetical order.
7. Validate parent, subsidiary, team, and staff references.
8. Update relevant canon documentation.
9. Run the complete repository and website validation.
10. Add the organization ID to the publication manifest only when its public
    page is ready.

## Draft command

From `website/`:

```powershell
npm run entity:new-organization -- --id example-organization --source source-id
```

The command creates an ignored draft and never overwrites a file. It does not
promote the draft into canon.

Do not create an external organization merely because a future match or
transfer might involve it.
