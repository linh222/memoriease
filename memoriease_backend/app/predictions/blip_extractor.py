import torch


def extract_query_blip_embedding(query, model, processor):
    text_input = processor['eval'](query)
    data = {'text_input': text_input}
    text_features = model.extract_features(data, mode='text')
    return text_features.text_embeds_proj[:, 0, :].squeeze().cpu().numpy()

def extract_query_clip_embedding(query, clip_model, clip_tokenizer):
    text = clip_tokenizer([query])
    with torch.no_grad(), torch.cuda.amp.autocast():
        text_features = clip_model.encode_text(text)
        text_features /= text_features.norm(dim=-1, keepdim=True)
    return text_features.squeeze().cpu().numpy()
